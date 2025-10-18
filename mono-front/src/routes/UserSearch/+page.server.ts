/**
 * =======================================================================
 * プログラム名：ユーザ検索画面用（サーバサイド処理）
 * プログラムファイル名：+page.server.ts
 * 画面名：ユーザ検索画面（/UserSearch）
 * 画面機能：
 *          $1：ユーザ単一検索（厳密一致）
 *          $2：登録ユーザリスト取得（全件）
 *          $3：新規ユーザ登録
 * 注意事項：
 *   - 連携バックエンドは json-server と REST API の2系統。changeBackendFlg で切替。
 *   - REST 側は password フィールド名、json-server 側は userPW。正規化で吸収。
 *   - REST 側の単一検索は /users?userID=... で配列返却を想定（空配列あり）。
 * 作成日：2025年10月12日
 * 作成者：深谷 理幸
 * =======================================================================
 */
// SSR 有効
export const ssr = true;
// 動的コンテンツのためプリレンダー無効
export const prerender = false;

import {
  fail,
  type Actions
} from '@sveltejs/kit';

// クライアントに返す正規化済みレコード型（REST API/json-server共通）
type Row = {
  id: number;
  userID: string;
  userName: string;
  userPW: string;
  accountCreate: string;
  deleteFlg: number;
};

// 0=json-server/1=REST API（必要に応じて切替）
const changeBackendFlg = 0 as 0 | 1;

// 検索URL生成用の入力値
type BuildArgs = {
  allMode: boolean;
  userID: string;
  userName: string
};

// 登録時のボディ生成に使う項目
type CreateBodyArgs = Pick<Row, 'userID' | 'userName' | 'userPW' | 'accountCreate'>;

/**
 * バックエンド差分吸収レイヤの契約
 * - URL/ボディ/重複チェック/normalizeの違いをここで吸収
 */
type Backend = {
  base: string;
  buildSearchUrl(args: BuildArgs): string;
  dupCheckUrl(userID: string): string;
  buildCreateBody(data: CreateBodyArgs): Record<string, unknown>;
  normalizeToRows(json: unknown): Row[];
};

/**
 * ============================
 * json-server実装
 * - ベースURL：/usersDataManagement
 * - クエリ：?userID=...&userName=...
 * - 重複チェック：?userID=...&_limit=1を200で配列返却
 * - 登録：userPW/deleteFlgをそのまま使用
 * ============================
 */
const JSON_BACKEND: Backend = {
  base: 'http://localhost:3000/usersDataManagement',
  buildSearchUrl({
    allMode,
    userID,
    userName
  }) {
    if (allMode) {
      return this.base;
    }

    // 条件付きのときはクエリパラメータを組み立て
    const qs = new URLSearchParams();

    if (userID) {
      qs.set('userID', userID);
    }

    if (userName) {
      qs.set('userName', userName);
    }
    
    const q = qs.toString();
    
    return q ? `${this.base}?${q}` : this.base;
  },
  dupCheckUrl(userID) {
    // 1件でも存在すれば配列が返る
    return `${this.base}?userID=${encodeURIComponent(userID)}&_limit=1`;
  },
  buildCreateBody(data) {
    // json-serverではdeleteFlgを持っている前提
    return {
      ...data, deleteFlg: 0
    };
  },
  normalizeToRows(json) {
    const arr = Array.isArray(json) ? json : [];
    return arr.map((x) => normalizeOne(x as Record<string, unknown>));
  }
};

/**
 * ============================
 * REST API 実装
 * - ベースURL：/users
 * - クエリ：?userID=...&userName=...（配列返却・0件は[]）
 * - 重複チェック：/by-userid/{userId}（200=存在、404=なし）
 * - 登録：passwordフィールド名に変換
 * ============================
 */
const REST_BACKEND: Backend = {
  base: 'http://localhost:8080/users',
  buildSearchUrl({
    allMode,
    userID,
    userName
  }) {
    if (allMode) {
      return this.base;
    }

    // REST API側も配列返しに寄せたエンドポイントを統一利用
    const qs = new URLSearchParams();
    
    if (userID) {
      qs.set('userID', userID);
    }
    
    if (userName) {
      qs.set('userName', userName);
    }

    return `${this.base}?${qs.toString()}`;
  },
  dupCheckUrl(userID) {
    // 200=存在、404=未存在
    return `${this.base}/by-userid/${encodeURIComponent(userID)}`;
  },
  buildCreateBody({
    userID,
    userName,
    userPW,
    accountCreate
  }) {
    // RESTのDTO名に合わせてpasswordに対応
    return {
      userID,
      userName,
      password: userPW,
      accountCreate
    };
  },
  normalizeToRows(json) {
    // REST APIは単一でもオブジェクト/配列の双方があり得る→どちらでも列挙へ
    if (Array.isArray(json)) {
      return json.map((x) => normalizeOne(x as Record<string, unknown>));
    }
    
    if (json && typeof json === 'object') {
      return [normalizeOne(json as Record<string, unknown>)];
    }
    return [];
  }
};

// 実際に使用するバックエンドをスイッチ
const BACKEND = changeBackendFlg === 1 ? JSON_BACKEND : REST_BACKEND;

/**
 * ============================
 * 正規化ユーティリティ
 * ============================
 */
// JSONを一行 Row に寄せる
function normalizeOne(x: Record<string, unknown>): Row {
  return {
    id: num(x['id']) ?? 0,
    // REST API側はuserIdの場合あり
    userID: str(x['userID']) ?? str(x['userId']) ?? '',
    userName: str(x['userName']) ?? '',
    userPW: str(x['userPW']) ?? str(x['password']) ?? '',
    accountCreate: str(x['accountCreate']) ?? str(x['createdAt']) ?? '',
    deleteFlg: num(x['deleteFlg']) ?? 0
  };
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/**
 * ============================
 * load：初期表示（フォーム用の空データ返却）
 * ============================
 */
export const load = (async () => {
  return {
    form: null
  };
}) satisfies import('@sveltejs/kit').ServerLoad;

/**
 * ============================
 * actions：search/create
 * ============================
 */
export const actions = {
  // 検索（全件or厳密一致）
  search: async (event: import('@sveltejs/kit').RequestEvent) => {
    const {
      request, fetch
    } = event;
    const formData = await request.formData();
    // チェックボックスは'on'または'1'を真とみなす
    const allMode = formData.get('allMode') === 'on' || formData.get('allMode') === '1';
    const userID = (formData.get('userID')?.toString() ?? '').trim();
    const userName = (formData.get('userName')?.toString() ?? '').trim();
    
    // 厳密一致検索時はサーバリクエスト前に基本バリデーション
    if (!allMode) {
      if (!userID) {
        return {
          error: 'ユーザIDを入力してください。'
        };
      }
      
      if (!userName) {
        return {
          error: 'ユーザ名を入力してください。'
        };
      }
      
      if (userID.length < 6 || userID.length >= 20) {
        return {
          error: 'ユーザIDは6文字以上20文字未満で入力してください。'
        };
      }
      
      if (userName.length < 2 || userName.length >= 30) {
        return {
          error: 'ユーザ名は2文字以上30文字未満で入力してください。'
        };
      }
    }
    
    let allResults: Row[] = [];
    let error: string | null = null;
    
    try {
      // バックエンド毎の最適な検索URLを生成
      const url = BACKEND.buildSearchUrl({
        allMode,
        userID,
        userName
      });
      
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // REST APIの単一検索相当で404が来るケース：0件扱いにする
        if (response.status === 404 && !allMode && changeBackendFlg === 1) {
          allResults = [];
        } else {
          error = '検索に失敗しました（サーバ応答エラー）';
        }
      } else {
        // 204/空ボディは0件扱い
        if (response.status === 204) {
          allResults = [];
        } else {
          const text = await response.text();
          if (!text) {
            allResults = [];
          } else {
            const raw: unknown = JSON.parse(text);
            let rows = BACKEND.normalizeToRows(raw);

            // json-server側ではuserName完全一致フィルタをクライアント側で追い打ち
            if (changeBackendFlg === 0 && !allMode) {
              rows = rows.filter((r) => r.userName === userName);
            }
            allResults = rows;
          }
        }
      }
    } catch {
      // fetch例外（ネットワーク等）
      error = '検索に失敗しました（通信エラー）';
    }
    // 画面での再表示用にそのまま返却
    return {
      allMode,
      userID,
      userName,
      allResults,
      error
    };
  },
  
  // 新規登録
  create: async (event: import('@sveltejs/kit').RequestEvent) => {
    const {
      request,
      fetch
    } = event;
    // 入力値取り出し＆整形
    const form = await request.formData();
    const userID = String(form.get('userID') ?? '').trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();
    const accountCreate = String(form.get('accountCreate') ?? '').trim();
    
    // サーバ側バリデーション
    if (!userID) {
      return fail(400, {
        error: 'ユーザIDを入力してください。'
      });
    }

    if (!userName) {
      return fail(400, {
        error: 'ユーザ名を入力してください。'
      });
    }
    
    if (!userPW) {
      return fail(400, {
        error: 'パスワードを入力してください。'
      });
    }

    if (!accountCreate) {
      return fail(400, {
        error: '作成日を入力してください。'
      });
    }
    
    if (userID.length < 6 || userID.length >= 20) {
      return fail(400, {
        error: 'ユーザIDは6文字以上20文字未満で入力してください。'
      });
    }
    
    if (userName.length < 2 || userName.length >= 30) {
      return fail(400, {
        error: 'ユーザ名は2文字以上30文字未満で入力してください。'
      });
    }
    
    if (userPW.length < 4 || userPW.length > 50) {
      return fail(400, {
        error: 'パスワードは4～50文字で入力してください。'
      });
    }
    
    try {
      // 1）重複チェック
      const checkUrl = BACKEND.dupCheckUrl(userID);
      const dupRes = await fetch(checkUrl, {
        cache: 'no-store'
      });
      
      if (changeBackendFlg === 0) {
        // json-server：配列返却→1件以上で重複
        if (!dupRes.ok) {
          return fail(dupRes.status, {
            error: '重複チェックに失敗しました。'
          });
        }
        
        const dupJson: unknown = await dupRes.json();
        
        const dupRows = JSON_BACKEND.normalizeToRows(dupJson);
        
        if (dupRows.length > 0) {
          return fail(409, {
            error: 'このユーザIDは既に存在します。'
          });
        }
      } else {
        // REST：200=存在、404=未存在
        if (dupRes.status === 200) {
          return fail(409, {
            error: 'このユーザIDは既に存在します。'
          });
        }
        
        if (dupRes.status !== 404) {
          return fail(dupRes.status, {
            error: '重複チェックに失敗しました。'
          });
        }
      }

      // 2）登録実行（RESTはpasswordにマッピング）
      const createBody = BACKEND.buildCreateBody({
        userID,
        userName,
        userPW,
        accountCreate
      });

      const createRes = await fetch(BACKEND.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createBody)
      });

      if (!createRes.ok) {
        if (createRes.status === 409) {
          return fail(409, {
            error: 'このユーザIDは既に存在します。'
          });
        }
        return fail(createRes.status, {
          error: 'ユーザの登録に失敗しました。'
        });
      }

      // 成功時はフォームを初期化し、サクセスメッセージだけ返す
      return {
        createdMessage: 'ユーザを登録しました。',
        allMode: false,
        userID: '',
        userName: '',
        allResults: [] as Row[],
        error: null
      };
    } catch {
      // 例外は通信エラーとして通知
      return fail(500, {
        error: 'ユーザの登録に失敗しました（通信エラー）。'
      });
    }
  }
} satisfies Actions;

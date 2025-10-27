/**
 * =======================================================================
 * プログラム名：ユーザ詳細画面用（サーバサイド処理）
 * プログラムファイル名：+page.server.ts
 * 画面名：ユーザ詳細画面（/UserDetails/[userID]）
 * 画面機能：
 *          $1：ユーザ単一取得（load）
 *          $2：ユーザデータ更新（actions.update）
 *          $3：ユーザデータ削除（actions.delete）
 * 注意事項：
 *   - 連携バックエンドはjson-serverとREST APIの2系統。changeBackendFlgで切替。
 *   - フロントとはuserIDを主キーのように扱いますが、更新/削除は最終的に数値idで実行。
 *   - REST API側はpasswordフィールド名、json-server側はuserPWを想定。正規化で吸収。
 * 作成日：2025年10月12日
 * 作成者：深谷 理幸
 * =======================================================================
 */

// SSR 有効
export const ssr = true;
// 動的ページのためプリレンダーは無効
export const prerender = false;

import {
  fail,
  redirect,
  type Actions
} from '@sveltejs/kit';

import type {
  PageServerLoad
} from './$types';

// 0=json-server / 1=REST API（必要に応じて切替）
const changeBackendFlg = 0 as 0 | 1;

// サーバ⇔クライアントで扱う正規化済みの行データ型
type Row = {
  // 更新/削除時に使用（REST API/json-server共通）
  id: number;
  // json-serverでもQuarkusでも両方対応
  idPath?: string | number;
  // 表示・遷移キー
  userID: string;
  userName: string;
  // REST API応答では通常返らない→normalize時にpasswordを代入
  userPW: string;
  // yyyy-MM-dd or ISO
  accountCreate: string;
  // json-server用（RESTでは未使用）
  deleteFlg?: number;
};

/**
 * バックエンド差分吸収レイヤ
 * - URL/HTTPメソッド/ボディの差を吸収
 * - normalize（形を Row に揃える）
 */
type Backend = {
  // userID指定の単一取得（REST APIは配列返しに寄せてURL生成）
  buildGetUrl(userID: string): string;
  // userIDで0〜1件の配列を返す検索URL（id再解決にも使用）
  buildListUrlByUserID(userID: string): string;
  // 更新APIのHTTP情報（URL/メソッド/ボディ）
  buildUpdateRequest(entityId: string | number, payload: {
    userID: string;
    userName: string;
    userPW: string
  }): {
    url: string; method: 'PATCH' | 'PUT'; body: Record<string, unknown>;
  };
  // 削除APIのURL
  buildDeleteUrl(entityId: string | number): string;
  // JSON→Row（1件）
  normalizeToOne(json: unknown): Row | null;
  // JSON→Row[] 
  normalizeToList(json: unknown): Row[];
  // ベースURL（デバッグ等用）
  base: string;
};

/**
 * ============================
 * 正規化ユーティリティ
 * ============================
 */
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

// サーバからの生JSON1件をRowに寄せる
function normalizeOne(x: Record<string, unknown>): Row {
  return {
    id: num(x['id']) ?? 0,
    idPath: x['id'] as string | number | undefined,
    // REST APIはuserIdの場合あり
    userID: str(x['userID']) ?? str(x['userId']) ?? '',
    userName: str(x['userName']) ?? '',
    userPW: str(x['userPW']) ?? str(x['password']) ?? '',
    accountCreate: str(x['accountCreate']) ?? str(x['createdAt']) ?? '',
    deleteFlg: num(x['deleteFlg']),
  };
}

/**
 * ============================
 * json-server 実装
 * ============================
 */
const JSON_BACKEND: Backend = {
  base: 'http://localhost:3000/usersDataManagement',
  buildGetUrl(userID) {
    // 厳密一致1件（配列）を返すクエリ
    return `${this.base}?userID=${encodeURIComponent(userID)}&_sort=id&_order=desc&_limit=1`;
  },

  buildListUrlByUserID(userID) {
    return `${this.base}?userID=${encodeURIComponent(userID)}&_sort=id&_order=desc&_limit=1`;
  },

  buildUpdateRequest(entityId, {
    userID,
    userName,
    userPW
  }) {
    // json-serverは部分更新PATCH/:id
    return {
      url: `${this.base}/${encodeURIComponent(String(entityId))}`,
      method: 'PATCH',
      body: {
        userID,
        userName,
        userPW
      },
    };
  },
  buildDeleteUrl(entityId) {
    return `${this.base}/${encodeURIComponent(String(entityId))}`;
  },
  normalizeToOne(json) {
    if (Array.isArray(json)) {
      return json[0] ? normalizeOne(json[0] as Record<string, unknown>) : null;
    }

    if (json && typeof json === 'object') {
      return normalizeOne(json as Record<string, unknown>);
    }

    return null;
  },
  normalizeToList(json) {
    return Array.isArray(json) ? (json as unknown[]).map((x) => normalizeOne(x as Record<string, unknown>)) : [];
  }
};

/**
 * ============================
 * REST API（Quarkus） 実装
 * ============================
 */
const REST_BACKEND: Backend = {
  base: 'http://localhost:8080/users',
  buildGetUrl(userID) {
    // users?userID=xxxとして配列を受け取りnormalize側で吸収
    return `${this.base}?userID=${encodeURIComponent(userID)}`;
  },
  buildListUrlByUserID(userID) {
    return `${this.base}?userID=${encodeURIComponent(userID)}`;
  },
  buildUpdateRequest(entityId, {
    userID,
    userName,
    userPW
  }) {
    // REST APIはPUT/users/{id}、フィールド名はpassword
    return {
      url: `${this.base}/${entityId}`,
      method: 'PUT',
      body: {
        userID,
        userName,
        password: userPW
      }
    };
  },
  buildDeleteUrl(entityId) {
    return `${this.base}/${entityId}`;
  },
  normalizeToOne(json) {
    if (Array.isArray(json)) {
      return json[0] ? normalizeOne(json[0] as Record<string, unknown>) : null;
    }

    if (json && typeof json === 'object') {
      return normalizeOne(json as Record<string, unknown>);
    }

    return null;
  },
  normalizeToList(json) {
    return Array.isArray(json) ? (json as unknown[]).map((x) => normalizeOne(x as Record<string, unknown>)) : [];
  }
};

// 実際に使用するバックエンドをスイッチ
const BACKEND = changeBackendFlg === 0 ? JSON_BACKEND : REST_BACKEND;

/**
 * ============================
 * フェイルセーフ JSON 取得
 * - 204/空ボディ→null
 * - JSON変換失敗→null
 * ============================
 */
async function safeJson<T>(res: Response): Promise<T | null> {
  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * ============================
 * userIDから1件取り出し（id解決にも利用）
 * ============================
 */
async function fetchOneByUserID(fetchFn: typeof fetch, userID: string): Promise<Row | null> {
  const url = BACKEND.buildListUrlByUserID(userID);
  const res = await fetchFn(url, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return null;
  }

  const json = await safeJson<unknown>(res);
  
  if (json == null) {
    return null;
  }

  const list = BACKEND.normalizeToList(json);
  return list[0] ?? null;
}

/**
 * ============================
 * load：詳細1件を取得
 * - クエリ ?updated=1 / ?deleted=1 のとき成功メッセージを返却
 * ============================
 */
export const load = (async ({
  params,
  fetch,
  url
}) => {
  const userIDParam = String(params.userID ?? '').trim();

  // 成功トースト用の文言（フロントでsuccessPopupに流す）
  let successMessage = '';

  if (url.searchParams.get('updated')) {
    successMessage = 'ユーザ情報を更新しました。';
  }

  if (url.searchParams.get('deleted')) {
    successMessage = 'ユーザ情報を削除しました。';
  }

  // パラメータ欠落時はそのまま返す（row:null）
  if (!userIDParam) {
    return {
      userID: '',
      row: null,
      successMessage
    };
  }

  try {
    // userID→1件（配列または1件）取得
    const res = await fetch(BACKEND.buildGetUrl(userIDParam),{cache: 'no-store'});
    const json = await safeJson<unknown>(res);
    const row = json ? BACKEND.normalizeToOne(json) : null;

    if (!res.ok) {
      // 404/5xx等はrow:nullで返す（フロント側がフォールバック表示）
      return {
        userID: userIDParam,
        row: null,
        successMessage
      };
    }
    return {
      userID: userIDParam,
      row,
      successMessage
    };
  } catch {
    // 簡易ロガー
    console.log('画面名：ユーザ検索画面 ' + 'ユーザID：' + userIDParam + ',メッセージ：' + successMessage);
    // 通信例外時もrow:null
    return {
      userID: userIDParam,
      row: null,
      successMessage
    };
  }
}) satisfies PageServerLoad;

/**
 * ============================
 * actions：更新／削除
 * - いずれもid未指定ならuserIDから再解決
 * - 成功時は303リダイレクトでクエリを付与し、成功トーストを出す
 * ============================
 */
export const actions = {
  update: async ({
    request,
    params,
    fetch
  }) => {
    const userIDParam = String(params.userID ?? '').trim();
    // フォーム値の取り出し
    const form = await request.formData();
    const entityId = Number(form.get('entityId') ?? 0);
    const userID = String(form.get('userID') ?? userIDParam).trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();

    // 簡易バリデーション（サーバ側）
    if (!userID) {
      // 簡易ロガー
      console.log('=====ユーザIDのリクエストは必須です。リクエスト情報=====')
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザID：' + userID);
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザ名：' + userName);
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザPW：' + userPW);
      console.log('=====ユーザIDのリクエストは必須です。リクエスト情報=====')
      return fail(400, {
        error: 'ユーザIDは必須です。', values: {
          userID,
          userName,
          userPW
        }
      });
    }

    if (!userName) {
      // 簡易ロガー
      console.log('=====ユーザ名のリクエストは必須です。リクエスト情報=====')
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザID：' + userID)
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザ名：' + userName);
      console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザPW：' + userPW)
      console.log('=====ユーザ名のリクエストは必須です。リクエスト情報=====')
      return fail(400, {
        error: 'ユーザ名は必須です。', values: {
          userID,
          userName,
          userPW
        }
      });
    }

    // id未指定ならuserIDから再解決（REST API/json-server共通）
    let id = entityId;
    let foundRow: Row | null = null;
    if (!id) {
      try {
        foundRow = await fetchOneByUserID(fetch, userIDParam);
        if (!foundRow) {
          // 簡易ロガー
          console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザIDが再解決処理で見つかりませんでした。リクエストされたユーザID：' + userIDParam)
          return fail(404, {
            error: `ユーザ「${
              userIDParam
            }」が見つかりません。`
          });
        }
        id = foundRow.id;
      } catch {
        // 簡易ロガー
        console.log('画面名：ユーザ検索画面 ' + 'ユーザ情報の更新に失敗しました。バックエンドシステムが起動しているかを確認してください。')
        return fail(500, {
          error: 'ユーザ情報の更新に失敗しました（通信エラー）。'
        });
      }
    }
    const idForPath: string | number = (changeBackendFlg === 0) ? (foundRow?.idPath ?? id) : id;

    // 更新リクエスト生成＆実行
    try {
      const req = BACKEND.buildUpdateRequest(idForPath, {
        userID,
        userName,
        userPW
      });
      const res = await fetch(req.url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      if (!res.ok) {
        if (res.status === 409) {
          // 簡易ロガー
          console.log('=====このユーザIDは既に存在します。=====')
          console.log('画面名：ユーザ検索画面 ' + 'レスポンスステータス：' + res.status)
          console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザID：' + userID)
          console.log('=====このユーザIDは既に存在します。=====')
          return fail(409, {
            error: 'このユーザIDは既に存在します。'
          });
        }
        // 簡易ロガー
        console.log('=====ユーザ情報の更新に失敗しました。=====')
        console.log('画面名：ユーザ検索画面 ' + 'レスポンスステータス：' + res.status)
        console.log('画面名：ユーザ検索画面 ' + 'リクエストユーザID：' + userID)
        console.log('=====ユーザ情報の更新に失敗しました。=====')
        return fail(res.status, {
          error: 'ユーザ情報の更新に失敗しました。'
        });
      }
    } catch {
      // 簡易ロガー
      console.log('=====ユーザ情報の更新に失敗しました（通信エラー）=====')
      console.log('画面名：ユーザ検索画面 ' + 'メッセージ：バックエンドシステムが起動しているかもしくはエンドポイントを確認してください。')
      console.log('=====ユーザ情報の更新に失敗しました（通信エラー）=====')
      return fail(500, {
        error: 'ユーザ情報の更新に失敗しました（通信エラー）。'
      });
    }

    // 成功→303で詳細へ戻し、?updated=1を付与（成功トースト表示用）
    throw redirect(303, `/UserDetails/${
      encodeURIComponent(userID)
    }?updated=1`);
  },

  // 削除処理
  delete: async ({
    params,
    request,
    fetch}) => {
    const userIDParam = String(params.userID ?? '').trim();
    // hiddenのentityIdを優先。無い場合はuserIDから解決
    const form = await request.formData();
    const entityId = Number(form.get('entityId') ?? 0);

    let id = entityId;
    let foundRow: Row | null = null;
    if (!id) {
      try {
        foundRow = await fetchOneByUserID(fetch, userIDParam);
        if (!foundRow) {
          return fail(404, {
            error: `ユーザ「${
              userIDParam
            }」が見つかりません。`
          });
        }
        id = foundRow.id;
      } catch {
        return fail(500, {
          error: 'ユーザの削除に失敗しました（通信エラー）。'
        });
      }
    }

    const idForPath: string | number = (changeBackendFlg === 0) ? (foundRow?.idPath ?? id) : id;

    // 削除実行
    try {
      const delUrl = BACKEND.buildDeleteUrl(idForPath);
      const res = await fetch(delUrl, {
        method: 'DELETE'
      });
      if (!res.ok) {
        // 簡易ロガー
        console.log('=====ユーザの削除に失敗しました。=====')
        console.log('画面名：ユーザ検索画面 ' + 'レスポンスステータス：' + res.status)
        console.log('画面名：ユーザ検索画面 ' + 'リクエストURL：' + delUrl)
        console.log('=====ユーザの削除に失敗しました。=====')
        return fail(res.status, {
          error: 'ユーザの削除に失敗しました。'
        });
      }
    } catch {
      // 簡易ロガー
      console.log('=====ユーザの削除に失敗しました（通信エラー）=====')
      console.log('画面名：ユーザ検索画面 ' + 'メッセージ：バックエンドシステムが起動しているかもしくはエンドポイントを確認してください。')
      console.log('=====ユーザの削除に失敗しました（通信エラー）=====')
      return fail(500, {
        error: 'ユーザの削除に失敗しました（通信エラー）。'
      });
    }

    // 成功→同ページに?deleted=1を付けて戻す（成功トースト表示）
    throw redirect(303, `/UserDetails/${
      encodeURIComponent(userIDParam)
    }?deleted=1`);
  }
} satisfies Actions;

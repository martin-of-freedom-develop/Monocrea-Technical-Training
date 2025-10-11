export const ssr = true;
export const prerender = false;

import {fail, type Actions} from '@sveltejs/kit';

type Row = {
  id: number;
  userID: string;
  userName: string;
  userPW: string;
  accountCreate: string;
  deleteFlg: number;
};

const changeBackendFlg = 1 as 0 | 1;

type BuildArgs = {
  allMode: boolean;
  userID: string;
  userName: string
};

type CreateBodyArgs = Pick<Row, 'userID' | 'userName' | 'userPW' | 'accountCreate'>;

type Backend = {
  base: string;
  buildSearchUrl(args: BuildArgs): string;
  dupCheckUrl(userID: string): string;
  buildCreateBody(data: CreateBodyArgs): Record<string, unknown>;
  normalizeToRows(json: unknown): Row[];
};

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
    return `${this.base}?userID=${encodeURIComponent(userID)}&_limit=1`;
  },
  buildCreateBody(data) {
    return {
      ...data, deleteFlg: 0
    };
  },
  normalizeToRows(json) {
    const arr = Array.isArray(json) ? json : [];
    return arr.map((x) => normalizeOne(x as Record<string, unknown>));
  }
};

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
    return `${this.base}/by-userid/${encodeURIComponent(userID)}`;
  },
  buildCreateBody({
    userID,
    userName,
    userPW,
    accountCreate
  }) {
    return {
      userID,
      userName,
      password: userPW,
      accountCreate
    };
  },
  normalizeToRows(json) {
    if (Array.isArray(json)) {
      return json.map((x) => normalizeOne(x as Record<string, unknown>));
    }
    
    if (json && typeof json === 'object') {
      return [normalizeOne(json as Record<string, unknown>)];
    }
    return [];
  }
};

const BACKEND = changeBackendFlg === 0 ? JSON_BACKEND : REST_BACKEND;

function normalizeOne(x: Record<string, unknown>): Row {
  return {
    id: num(x['id']) ?? 0,
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

export const load = (async () => {
  return {
    form: null
  };
}) satisfies import('@sveltejs/kit').ServerLoad;

export const actions = {
  search: async (event: import('@sveltejs/kit').RequestEvent) => {
    const {
      request, fetch
    } = event;
    const formData = await request.formData();
    const allMode = formData.get('allMode') === 'on' || formData.get('allMode') === '1';
    const userID = (formData.get('userID')?.toString() ?? '').trim();
    const userName = (formData.get('userName')?.toString() ?? '').trim();
    
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
      const url = BACKEND.buildSearchUrl({
        allMode,
        userID,
        userName
      });
      
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 404 && !allMode && changeBackendFlg === 1) {
          allResults = [];
        } else {
          error = '検索に失敗しました（サーバ応答エラー）';
        }
      } else {
        if (response.status === 204) {
          allResults = [];
        } else {
          const text = await response.text();
          if (!text) {
            allResults = [];
          } else {
            const raw: unknown = JSON.parse(text);
            let rows = BACKEND.normalizeToRows(raw);
            if (changeBackendFlg === 0 && !allMode) {
              rows = rows.filter((r) => r.userName === userName);
            }
            allResults = rows;
          }
        }
      }
    } catch {
      error = '検索に失敗しました（通信エラー）';
    }
    return {
      allMode,
      userID,
      userName,
      allResults,
      error
    };
  },
  
  create: async (event: import('@sveltejs/kit').RequestEvent) => {
    const {
      request,
      fetch
    } = event;
    const form = await request.formData();
    const userID = String(form.get('userID') ?? '').trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();
    const accountCreate = String(form.get('accountCreate') ?? '').trim();
    
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
      const checkUrl = BACKEND.dupCheckUrl(userID);
      const dupRes = await fetch(checkUrl, {
        cache: 'no-store'
      });
      
      if (changeBackendFlg === 0) {
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

      return {
        createdMessage: 'ユーザを登録しました。',
        allMode: false,
        userID: '',
        userName: '',
        allResults: [] as Row[],
        error: null
      };
    } catch {
      return fail(500, {
        error: 'ユーザの登録に失敗しました（通信エラー）。'
      });
    }
  }
} satisfies Actions;

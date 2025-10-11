export const ssr = true;
export const prerender = false;

import {fail, redirect, type Actions} from '@sveltejs/kit';
import type {PageServerLoad} from './$types';

const changeBackendFlg = 1 as 0 | 1;

type Row = {
  id: number;
  userID: string;
  userName: string;
  userPW: string;
  accountCreate: string;
  deleteFlg?: number;
};

type Backend = {
  buildGetUrl(userID: string): string;
  buildListUrlByUserID(userID: string): string;
  buildUpdateRequest(entityId: number, payload: {
    userID: string;
    userName: string;
    userPW: string
  }): {
    url: string; method: 'PATCH' | 'PUT'; body: Record<string, unknown>;
  };
  buildDeleteUrl(entityId: number): string;
  normalizeToOne(json: unknown): Row | null;
  normalizeToList(json: unknown): Row[];
  base: string;
};

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

function normalizeOne(x: Record<string, unknown>): Row {
  return {
    id: num(x['id']) ?? 0,
    userID: str(x['userID']) ?? str(x['userId']) ?? '',
    userName: str(x['userName']) ?? '',
    userPW: str(x['userPW']) ?? str(x['password']) ?? '',
    accountCreate: str(x['accountCreate']) ?? str(x['createdAt']) ?? '',
    deleteFlg: num(x['deleteFlg']),
  };
}

const JSON_BACKEND: Backend = {
  base: 'http://localhost:3000/usersDataManagement',
  buildGetUrl(userID) {
    return `${this.base}?userID=${encodeURIComponent(userID)}&_sort=id&_order=desc&_limit=1`;
  },
  buildListUrlByUserID(userID) {
    return `${this.base}?userID=${encodeURIComponent(userID)}&_sort=id&_order=desc&_limit=1`;
  },
  buildUpdateRequest(entityId, {
    userID,
    userName,
    userPW }) {
    return {
      url: `${this.base}/${entityId}`,
      method: 'PATCH',
      body: {
        userID,
        userName,
        userPW
      },
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

const REST_BACKEND: Backend = {
  base: 'http://localhost:8080/users',
  buildGetUrl(userID) {
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

const BACKEND = changeBackendFlg === 0 ? JSON_BACKEND : REST_BACKEND;

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

async function fetchOneByUserID(fetchFn: typeof fetch, userID: string): Promise<Row | null> {
  const url = BACKEND.buildListUrlByUserID(userID);
  const res = await fetchFn(url, {cache: 'no-store'});
  
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

export const load = (async ({
  params,
  fetch,
  url
}) => {
  const userIDParam = String(params.userID ?? '').trim();

  let successMessage = '';

  if (url.searchParams.get('updated')) {
    successMessage = 'ユーザ情報を更新しました。';
  }

  if (url.searchParams.get('deleted')) {
    successMessage = 'ユーザを削除しました。';
  }

  if (!userIDParam) {
    return {
      userID: '',
      row: null,
      successMessage
    };
  }

  try {
    const res = await fetch(BACKEND.buildGetUrl(userIDParam), {cache: 'no-store'});
    
    if (!res.ok) {
      return {
        userID: userIDParam,
        row: null,
        successMessage
      };
    }

    const json = await safeJson<unknown>(res);
    const row = json ? BACKEND.normalizeToOne(json) : null;
    return {
      userID: userIDParam,
      row,
      successMessage
    };
  } catch {
    return {
      userID: userIDParam,
      row: null,
      successMessage
    };
  }
}) satisfies PageServerLoad;

export const actions = {
  update: async ({request, params, fetch}) => {
    const userIDParam = String(params.userID ?? '').trim();
    const form = await request.formData();
    const entityId = Number(form.get('entityId') ?? 0);
    const userID = String(form.get('userID') ?? userIDParam).trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();

    if (!userID) {
      return fail(400, {
        error: 'ユーザIDは必須です。', values: {
          userID,
          userName,
          userPW
        }
      });
    }

    if (!userName) {
      return fail(400, {
        error: 'ユーザ名は必須です。', values: {
          userID,
          userName,
          userPW
        }
      });
    }

    let id = entityId;
    if (!id) {
      try {
        const found = await fetchOneByUserID(fetch, userIDParam);
        if (!found) {
          return fail(404, {
            error: `ユーザ「${userIDParam}」が見つかりません。`
          });
        }
        id = found.id;
      } catch {
        return fail(500, {
          error: 'ユーザ情報の更新に失敗しました（通信エラー）。'
        });
      }
    }

    try {
      const req = BACKEND.buildUpdateRequest(id, {userID, userName, userPW});
      const res = await fetch(req.url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      if (!res.ok) {
        if (res.status === 409) {
          return fail(409, {
            error: 'このユーザIDは既に存在します。'
          });
        }
        return fail(res.status, {
          error: 'ユーザ情報の更新に失敗しました。'
        });
      }
    } catch {
      return fail(500, {
        error: 'ユーザ情報の更新に失敗しました（通信エラー）。'
      });
    }

    throw redirect(303, `/UserDetails/${encodeURIComponent(userID)}?updated=1`);
  },

  delete: async ({params, request, fetch}) => {
    const userIDParam = String(params.userID ?? '').trim();
    const form = await request.formData();
    const entityId = Number(form.get('entityId') ?? 0);

    let id = entityId;
    if (!id) {
      try {
        const found = await fetchOneByUserID(fetch, userIDParam);
        if (!found) {
          return fail(404, {
            error: `ユーザ「${userIDParam}」が見つかりません。`
          });
        }
        id = found.id;
      } catch {
        return fail(500, {
          error: 'ユーザの削除に失敗しました（通信エラー）。'
        });
      }
    }

    try {
      const delUrl = BACKEND.buildDeleteUrl(id);
      const res = await fetch(delUrl, {method: 'DELETE'});
      if (!res.ok) {
        return fail(res.status, {
          error: 'ユーザの削除に失敗しました。'
        });
      }
    } catch {
      return fail(500, {
        error: 'ユーザの削除に失敗しました（通信エラー）。'
      });
    }

    throw redirect(303, `/UserDetails/${encodeURIComponent(userIDParam)}?deleted=1`);
  }
} satisfies Actions;

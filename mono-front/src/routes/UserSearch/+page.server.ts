// src/routes/UserSearch/+page.server.ts
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

const API_BASE = 'http://localhost:3000/usersDataManagement';

/**
 * バックエンド切り替えフラグ
 * 0 → json-server
 * 1 → REST API
 */
// const changeBackendFlg = 0;

export const load = (async () => {
  return {form: null};
}) satisfies import('@sveltejs/kit').ServerLoad;

export const actions = {
  // ★ default をやめて named action に変更
  search: async (event) => {
    const { request, fetch } = event;
    const formData = await request.formData();

    const allMode = formData.get('allMode') === 'on' || formData.get('allMode') === '1';
    const userID = (formData.get('userID')?.toString() ?? '').trim();
    const userName = (formData.get('userName')?.toString() ?? '').trim();

    if (!allMode) {
      if (!userID) return {
        error: 'ユーザIDを入力してください。'
      };
      if (!userName) return {
        error: 'ユーザ名を入力してください。'
      };
      if (userID.length < 6 || userID.length >= 20) return {
        error: 'ユーザIDは6文字以上20文字未満で入力してください。'
      };
      if (userName.length < 2 || userName.length >= 30) return {
        error: 'ユーザ名は2文字以上30文字未満で入力してください。'
      };
    }

    let allResults: Row[] = [];
    let error: string | null = null;

    try {
      const queryString = new URLSearchParams();
      if (!allMode) {
        if (userID) queryString.set('userID', userID);
        if (userName) queryString.set('userName', userName);
      }
      
      const url = queryString.toString() ? `${API_BASE}?${queryString}` : API_BASE;

      const response = await fetch(url, {
        cache: 'no-store'
      });
      if (!response.ok) error = '検索に失敗しました（サーバ応答エラー）';
      else allResults = (await response.json()) as Row[];
    } catch {
      error = '検索に失敗しました（通信エラー）';
    }

    return {allMode, userID, userName, allResults, error};
  },

  create: async ({request, fetch}) => {
    const form = await request.formData();
    const userID = String(form.get('userID') ?? '').trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();
    const accountCreate = String(form.get('accountCreate') ?? '').trim();

    if (!userID) return fail(400, {
      error: 'ユーザIDを入力してください。'
    });
    if (!userName) return fail(400, {
      error: 'ユーザ名を入力してください。'
    });
    if (!userPW) return fail(400, {
      error: 'パスワードを入力してください。'
    });
    if (!accountCreate) return fail(400, {
      error: '作成日を入力してください。'
    });
    if (userID.length < 6 || userID.length >= 20) return fail(400, {
      error: 'ユーザIDは6文字以上20文字未満で入力してください。'
    });
    if (userName.length < 2 || userName.length >= 30) return fail(400, {
      error: 'ユーザ名は2文字以上30文字未満で入力してください。'
    });
    if (userPW.length < 4 || userPW.length > 50) return fail(400, {
      error: 'パスワードは4～50文字で入力してください。'
    });

    try {
      const checkUrl = `${API_BASE}?userID=${encodeURIComponent(userID)}&_limit=1`;
      const dupRes = await fetch(checkUrl, {cache: 'no-store'});
      if (!dupRes.ok) return fail(dupRes.status, {error: '重複チェックに失敗しました。'});
      const dup = (await dupRes.json()) as Row[];
      if (dup.length > 0) return fail(409, {error: 'このユーザIDは既に存在します。'});

      const createRes = await fetch(API_BASE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userID,
          userName,
          userPW,
          accountCreate,
          deleteFlg: 0
        } as Partial<Row>)
      });

      if (!createRes.ok) return fail(createRes.status, {
        error: 'ユーザの登録に失敗しました。'
      });

      return {
        createdMessage: 'ユーザを登録しました。',
        // 画面側の状態を初期化したいときの戻り値
        allMode: false,
        userID: '',
        userName: '',
        allResults: [] as Row[],
        error: null
      };
    } catch {
      return fail(500, { error: 'ユーザの登録に失敗しました（通信エラー）。' });
    }
  }
} satisfies Actions;

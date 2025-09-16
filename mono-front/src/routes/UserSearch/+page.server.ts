export const ssr = true;
export const prerender = false;

type Row = {
  id: number;
  userID: string;
  userName: string;
  userPW: string;
  accountCreate: string;
  deleteFlg: number;
};

const API_BASE = 'http://localhost:3000/usersDataManagement';

export const load = (async () => {
  return {form: null};
}) satisfies import('@sveltejs/kit').ServerLoad;

export const actions = {
  default: async (event) => {
    const {request, fetch} = event;
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
      if (userID.length < 6 || userID.length >= 20)
        return {
          error: 'ユーザIDは6文字以上20文字未満で入力してください。'
        };
      if (userName.length < 2 || userName.length >= 30)
        return {
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

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) error = '検索に失敗しました（サーバ応答エラー）';
      else allResults = (await response.json()) as Row[];
    } catch {
      error = '検索に失敗しました（通信エラー）';
    }

    return { allMode, userID, userName, allResults, error };
  }
} satisfies import('@sveltejs/kit').Actions;

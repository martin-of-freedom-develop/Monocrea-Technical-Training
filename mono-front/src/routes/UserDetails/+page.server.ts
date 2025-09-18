export const ssr = true;
export const prerender = false;

// 動作確認用最小構成

type Row = {
    id: number;
    userID: string;
    userName: string;
    userPW: string;
    accountCreate: string;
};

const API_BASE = 'http://localhost:3000/usersDataManagement';

import type {PageServerLoad} from './$types';
import {error} from '@sveltejs/kit';

export const load: PageServerLoad = async ({url, fetch}) => {
    const userID = url.searchParams.get('userID')?.trim();
    if (!userID) {
        throw error (400, 'ユーザIDが指定されていません。');
    }

    const reqUrl = `${API_BASE}?userID=${encodeURIComponent(userID)}`;

    try {
        const res = await fetch(reqUrl, {cache: 'no-store'});
        if (!res.ok) {
            throw error(res.status, 'ユーザ情報の取得に失敗しました。');
        }

        const rows = (await res.json()) as Row[];
        const row = rows?.[0];
        if (!row) {
            throw error(404, `ユーザ「${userID}」は見つかりませんでした。`);
        }
        return {userID, row};
    } catch {
        throw error(500, 'ユーザ情報の取得時にエラーが発生しました。');
    }
};

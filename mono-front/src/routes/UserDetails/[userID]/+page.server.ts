// src/routes/UserDetails/[userID]/+page.server.ts
export const ssr = true;
export const prerender = false;

import {fail, redirect, type Actions} from '@sveltejs/kit';
import type {PageServerLoad} from './$types';

const API_BASE = 'http://localhost:3000/usersDataManagement';

type Row = {
  id: number;
  userID: string;
  userName: string;
  userPW: string;
  accountCreate: string;
  deleteFlg?: number;
};

export const load = (async ({ params, fetch, url }) => {
  const userIDParam = String(params.userID ?? '').trim();
  const debug: Record<string, unknown> = {userID: userIDParam, where: '[userID]/+page.server.ts'};

  // ポップアップ用メッセージ（更新 or 削除）
  let successMessage = '';
  if (url.searchParams.get('updated')) successMessage = 'ユーザ情報を更新しました。';
  if (url.searchParams.get('deleted')) successMessage = 'ユーザを削除しました。';

  if (!userIDParam) {
    return {userID: '', row: null, __debug: {...debug, reason: 'no userID in params'}, successMessage};
  }

  const urlExact = `${API_BASE}?userID=${encodeURIComponent(userIDParam)}&_sort=id&_order=desc&_limit=1`;
  debug.try_exact = urlExact;

  try {
    let res = await fetch(urlExact, {cache: 'no-store'});
    debug.exact_ok = res.ok;
    debug.exact_status = res.status;

    let row: Row | null = null;
    if (res.ok) {
      const rows = (await res.json()) as Row[];
      debug.exact_count = rows?.length ?? 0;
      row = rows?.[0] ?? null;
    }

    if (!row) {
      const urlLike = `${API_BASE}?userID_like=${encodeURIComponent('^' + escapeRegExp(userIDParam) + '$')}&_sort=id&_order=desc&_limit=1`;
      debug.try_like = urlLike;

      res = await fetch(urlLike, { cache: 'no-store' });
      debug.like_ok = res.ok;
      debug.like_status = res.status;

      if (res.ok) {
        const rows = (await res.json()) as Row[];
        debug.like_count = rows?.length ?? 0;
        row = rows?.[0] ?? null;
      }
    }

    if (!row && /^\d+$/.test(userIDParam)) {
      const byIdUrl = `${API_BASE}/${userIDParam}`;
      debug.try_byId = byIdUrl;

      const byId = await fetch(byIdUrl, { cache: 'no-store' });
      debug.byId_ok = byId.ok;
      debug.byId_status = byId.status;

      if (byId.ok) {
        const one = (await byId.json()) as Row;
        if (one && (one.userID === userIDParam || String(one.id) === userIDParam)) {
          row = one;
        }
      }
    }

    return {userID: userIDParam, row, __debug: debug, successMessage};
  } catch (e) {
    debug.error = e instanceof Error ? e.message : String(e);
    return {userID: userIDParam, row: null, __debug: debug, successMessage};
  }
}) satisfies PageServerLoad;

export const actions = {
  // 更新
  update: async ({ request, params, fetch }) => {
    const userIDParam = String(params.userID ?? '').trim();

    const form = await request.formData();
    const userID = String(form.get('userID') ?? userIDParam).trim();
    const userName = String(form.get('userName') ?? '').trim();
    const userPW = String(form.get('userPW') ?? '').trim();

    if (!userID) return fail(400, {error: 'ユーザIDは必須です。', values: {userID, userName, userPW}});
    if (!userName) return fail(400, {error: 'ユーザ名は必須です。', values: {userID, userName, userPW }});

    // 現行レコードを特定（URLパラメータの userID で検索）
    const findUrl = `${API_BASE}?userID=${encodeURIComponent(userIDParam)}&_sort=id&_order=desc&_limit=1`;
    const found = await fetch(findUrl, {cache: 'no-store'});
    if (!found.ok) return fail(found.status, {error: '既存ユーザの検索に失敗しました。'});

    const rows = (await found.json()) as Row[];
    const current = rows?.[0];
    if (!current) return fail(404, {error: `ユーザ「${userIDParam}」が見つかりません。`});

    // accountCreate は更新しない
    const payload: Partial<Row> = {userID, userName, userPW};

    const patchUrl = `${API_BASE}/${current.id}`;
    const upd = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if (!upd.ok) return fail(upd.status, {error: 'ユーザ情報の更新に失敗しました。'});

    // 成功 → 303 で戻し、?updated=1
    throw redirect(303, `/UserDetails/${encodeURIComponent(userID)}?updated=1`);
  },

  // 削除
  delete: async ({params, fetch}) => {
    const userIDParam = String(params.userID ?? '').trim();

    // まず現在のレコードを特定
    const findUrl = `${API_BASE}?userID=${encodeURIComponent(userIDParam)}&_sort=id&_order=desc&_limit=1`;
    const found = await fetch(findUrl, {cache: 'no-store'});
    if (!found.ok) return fail(found.status, {error: '削除対象の検索に失敗しました。'});

    const rows = (await found.json()) as Row[];
    const current = rows?.[0];
    if (!current) return fail(404, {error: `ユーザ「${userIDParam}」が見つかりません。`});

    // json-server へ DELETE
    const delUrl = `${API_BASE}/${current.id}`;
    const res = await fetch(delUrl, {method: 'DELETE'});

    if (!res.ok) return fail(res.status, {error: 'ユーザの削除に失敗しました。'});

    // 成功 → 同じURLで再読込すると row は null になるが、ポップアップは表示される
    throw redirect(303, `/UserDetails/${encodeURIComponent(userIDParam)}?deleted=1`);
  }
} satisfies Actions;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

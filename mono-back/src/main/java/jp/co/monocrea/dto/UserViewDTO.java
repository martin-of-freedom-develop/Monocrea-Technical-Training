package jp.co.monocrea.dto;

import java.time.LocalDate;

/**
 * ユーザ情報の「外部公開用ビュー」を表すDTO（Data Transfer Object）。
 * <p>
 * APIレスポンスなどでクライアントに返却するための投影モデルです。
 * </p>
 * 
 * <ul>
 *  <li>{@link userName}:ユーザ名（表示名）</li>
 *  <li>{@link userID}:業務上の一意なユーザID</li>
 *  <li>{@link password}:ユーザパスワード</li>
 *  <li>{@link accountCreate}:アカウント作成日（サーバ基準）</li>
 * </ul>
 * 
 * @since 1.0
 */
public class UserViewDTO {

    public Long id;

    /**
     * ユーザ名（表示名）。
     */
    public String userName;

    /**
     * 業務上の一意なユーザID。
     */
    public String userID;

    /**
     * アカウント作成日。
     */
    public LocalDate accountCreate;

    /**
     * ユーザパスワード
     */
    public String password;

    /**
     * デフォルトコンストラクタ。
     * <p>フレームワークやシリアライザ向けに用意されています。</p>
     */
    public UserViewDTO() {

    }

    /**
     * 各プロパティを指定して{@code UserViewDTO}を生成します。
     * 
     * @param userName ユーザ名（表示名）
     * @param userID 業務上の一意なユーザID
     * @param password ユーザパスワード
     * @param accountCreate アカウント作成日
     */
    public UserViewDTO(Long id, String userName, String userID, String password, LocalDate accountCreate) {
        this.id = id;
        this.userName = userName;
        this.userID = userID;
        this.password = password;
        this.accountCreate = accountCreate;
    }
}

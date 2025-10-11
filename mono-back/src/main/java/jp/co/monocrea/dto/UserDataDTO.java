package jp.co.monocrea.dto;

import java.util.Date;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ユーザ登録／更新リクエストの受け皿となる DTO（Data Transfer Object）。
 * <p>
 * クライアントから受け取る入力値を一時的に保持するためのクラスであり、
 * ドメインロジックや永続化の責務は持ちません。
 * </p>
 * 
 * <ul>
 *  <li>{@code userName}:表示名などのユーザ名</li>
 *  <li>{@code userID}:業務上の一意なユーザID</li>
 *  <li>{@code password}:パスワード（入力値。保存時は別レイヤで適切に処理すること）</li>
 *  <li>{@code accountCreate}:アカウント作成日時（クライアント申告値。未指定可）</li>
 * </ul>
 * 
 * <h2>注意</h2>
 * <p>
 * {@code password} はクライアントから受け取る生の文字列です。
 * 実際に保管する際は、アプリケーション層でハッシュ化などの安全な処理を行ってください。
 * </p>
 * 
 * @since 1.0
 */
public class UserDataDTO {

    // ユーザ名（表示名）
    @NotBlank @Size(max = 64)
    private String userName;

    // 処理上の一意なユーザID
    @NotBlank @Size(max = 64)
    private String userID;

    /**
     * パスワード（入力値）。
     * <p>このクラスは単なる入力DTOであり、暗号化／ハッシュ化は行いません。</p>
     */
    @NotBlank @Size(max = 64)
    private String password;

    // アカウント作成日時（クライアント申告値）。
    private Date accountCreate;

    /**
     * ユーザ名を返します。
     * 
     * @return ユーザ名（表示名）
     */
    public String getUserName() {
        return userName;
    }

    /**
     * ユーザIDを返します。
     * 
     * @return 処理上の一意なユーザID
     */
    public String getUserID() {
        return userID;
    }

    /**
     * パスワード（入力値）を返します。
     * 
     * @return パスワードの文字列
     */
    public String getPassword() {
        return password;
    }

    /**
     * アカウント作成日時（クライアント申告値）を返します。
     * 
     * @return アカウント作成日時。未指定の場合は {@code null}
     */
    public Date getAccountCreate() {
        return accountCreate;
    }

    /**
     * ユーザ名を設定します。
     * 
     * @param userName ユーザ名（表示名）
     */
    public void setUserName(String userName) {
        this.userName = userName;
    }

    /**
     * ユーザIDを設定します。
     * 
     * @param userID 処理上の一意なユーザID
     */
    public void setUserID(String userID) {
        this.userID = userID;
    }

    /**
     * パスワード（入力値）を設定します。
     * 
     * @param password パスワードの文字列
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * カウント作成日時（クライアント申告値）を設定します。
     * 
     * @param accountCreate アカウント作成日時。未指定の場合は {@code null}
     */
    public void setAccountCreate(Date accountCreate) {
        this.accountCreate = accountCreate;
    }
}

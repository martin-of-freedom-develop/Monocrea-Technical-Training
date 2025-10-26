package jp.co.monocrea.mapper;

import java.time.ZoneId;

import jp.co.monocrea.dto.UserDataDTO;
import jp.co.monocrea.dto.UserViewDTO;
import jp.co.monocrea.entity.UserAccount;

/**
 * {@link UserDataDTO}／{@link UserAccount}／{@link UserViewDTO}間のマッピングを担う
 * ステートレスなユーティリティクラス。
 * <p>
 * 本クラスは生成不要のため、コンストラクタはprivateとしてあります。
 * </p>
 * 
 * <h2>設計メモ</h2>
 * <ul>
 *  <li>入力DTO（{@code UserDataDTO}）→エンティテ（{@code UserAccount}）への変換では、{@code java.util.Date}をシステム既定タイムゾーンで{@code LocalDate}に変換します。</li>
 *  <li>パスワードは平文のままエンティティへ設定します。</li>
 * <li>ビューDTO（{@code UserViewDTO}）にはパスワード等の機微情報は含めません。</li>
 * </ul>
 * 
 * @since 1.0
 */
public final class UserMapper {
  /**
  * インスタンス化させないためのプライベートコンストラクタ。
  */
  private UserMapper() {

  }

  /**
  * 入力DTOからエンティティへ変換します。
  * <p>
  * 具体的には以下を行います：
  * </p>
  * <ul>
  *  <li>{@code userName},{@code userID},{@code password}をそれぞれ{@code userName},{@code userId},{@code password}に設定</li>
  *  <li>{@code accountCreate}が非 null の場合、システム既定のタイムゾーンで{@code LocalDate}に変換して設定</li>
  *  <li>null の場合はエンティティ側の{@code @PrePersist}で現在日が補完されます</li>
  * 
  * <p>
  * <strong>注意：</strong>この実装では入力されたパスワードをハッシュ化しません。
  * </p>
  * @param userDataDTO クライアントから受け取ったユーザ情報DTO
  * @return 変換後の {@link UserAccount} エンティティ
  */
  public static UserAccount toEntity(UserDataDTO userDataDTO) {
    UserAccount userAccount = new UserAccount();
    userAccount.userName = userDataDTO.getUserName();
    userAccount.userId = userDataDTO.getUserID();
    userAccount.password = userDataDTO.getPassword();

    if (userDataDTO.getAccountCreate() != null) {
      userAccount.accountCreate = userDataDTO.getAccountCreate()
        .toInstant()
        .atZone(ZoneId.systemDefault())
        .toLocalDate();
    }
    return userAccount;
  }

  /**
  * エンティティからレスポンス用のビューDTOへ変換します。
  * <p>
  * パスワード等の機微情報は含めません。
  * </p>
  * 
  * @param userAccount 変換元のエンティティ
  * @return クライアント返却用の{@link UserViewDTO}
  */
  public static UserViewDTO toView(UserAccount userAccount) {
    return new UserViewDTO(
      userAccount.id,
      userAccount.userName,
      userAccount.userId,
      userAccount.password,
      userAccount.accountCreate
    );
  }

  /**
  * エンティティに対し、入力DTOで指定された値のみを反映（部分更新）します。
  * <p>
  * 次のプロパティを条件付きで更新します：
  * </p>
  * <ul>
  *  <li>{@code userName}（非 null のとき上書き）</li>
  *  <li>{@code password} → {@code password}（非nullのとき上書き）</li>
  *  <li>{@code userID} → {@code userId}（非nullかつ値が異なるとき上書き）</li>
  * </ul>
  * 
  * p><strong>注意：</strong>{@code userId} はDBでユニーク制約がある想定です。
  * 合チェックは呼び出し側（リソース層等）で行ってください。</p>
  * 
  * @param userAccount 更新対象のエンティティ
  * @param userDataDTO 更新値を保持するDTO（nullのフィールドは更新しません）
  */
  public static void applyUpdate(UserAccount userAccount, UserDataDTO userDataDTO) {
    if (userDataDTO.getUserName() != null) {
      userAccount.userName = userDataDTO.getUserName();
    }

    if (userDataDTO.getPassword() != null) {
      userAccount.password = userDataDTO.getPassword();
    }

    if (userDataDTO.getUserID() != null && !userDataDTO.getUserID().equals(userAccount.userId)) {
      userAccount.userId = userDataDTO.getUserID();
    }
  }
}

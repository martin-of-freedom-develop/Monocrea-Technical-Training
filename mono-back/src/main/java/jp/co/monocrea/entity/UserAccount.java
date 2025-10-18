package jp.co.monocrea.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Optional;

/**
 * ユーザアカウントを表す永続化エンティティ。
 * <p>
 * テーブル {@code usermanagement} にマップされ、主キーは {@link PanacheEntity#id} を利用します。
 * 各フィールドは以下のカラムに対応します。
 * </p>
 * <ul>
 *  <li>{@code userName} → {@code username}（NOT NULL）</li>
 *  <li>{@code userId} → {@code userid}（NOT NULL, UNIQUE, 長さ64）</li>
 *  <li>{@code password} → {@code userpw}（NOT NULL, 長さ64）</li>
 *  <li>{@code accountCreate} → {@code accountcreate}（NOT NULL）</li>
 * </ul>
 * 
 * <h2>ライフサイクル</h2>
 * <p>
 * {@link #onCreate()} にて {@code accountCreate} が未設定の場合は現在日で補完します。
 * </p>
 * 
 * @since 1.0
 */
@Entity
@Table(name = "usermanagement")
public class UserAccount extends PanacheEntity {
  /**
   * 表示名。NULL不可。
   */
  @Column(name = "username", nullable = false)
  public String userName;

  /**
   * 業務上の一意なユーザID。NULL不可・ユニーク・最大64文字。
   */
  @Column(name = "userid", nullable = false, unique = true, length = 64)
  public String userId;

  /**
   * パスワード。NULL不可・最大64文字。
   */
  @Column(name = "userpw", nullable = false, length = 64)
  public String password;

  /**
   * アカウント作成日。NULL不可。
   */
  @Column(name = "accountcreate", nullable = false)
  public LocalDate accountCreate;

  /**
   * 新規永続化前の初期化。
   * <p>accountCreate が未設定の場合に、現在日を設定します。</p>
   */
  @PrePersist
  void onCreate() {
    if (accountCreate == null) {
        accountCreate = LocalDate.now();
    }
  }

  /**
   * userId（業務ID）でエンティティを検索します。
   * @param userId 検索する業務ID
   * @return 該当エンティティの {@link Optional}
   */
  public static Optional<UserAccount> findByUserId(String userId) {
    return find("userId", userId).firstResultOptional();
  }
}

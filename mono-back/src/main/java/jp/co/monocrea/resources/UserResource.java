package jp.co.monocrea.resources;

import java.net.URI;
import java.util.List;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;

import jp.co.monocrea.dto.UserDataDTO;
import jp.co.monocrea.dto.UserViewDTO;
import jp.co.monocrea.entity.UserAccount;
import jp.co.monocrea.mapper.UserMapper;

/**
 * ユーザに関するRESTエンドポイント。
 * <p>
 * ベースパス：{@code /users}、メディアタイプ：{@code application/json}
 * </p>
 * 
 * <h2>提供機能</h2>
 * <ul>
 *  <li>一覧取得（ID／名前での簡易フィルタ）</li>
 *  <li>userIdによる単一取得</li>
 *  <li>作成（重複チェックあり）</li>
 *  <li>更新（部分更新・重複チェックあり）</li>
 *  <li>削除</li>
 * </ul>
 * 
 * @since 1.0
 */
@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
  /**
   * ユーザ一覧を取得します。簡易フィルタをサポートします。
   * 
   * <p><strong>クエリパラメータ</strong></p>
   * <ul>
   *  <li>{@code userID}：業務IDでフィルタ</li>
   *  <li>{@code userId}：{@code userID} のエイリアス（互換用）</li>
   *  <li>{@code userName}：表示名でフィルタ</li>
   * </ul>
   * 
   * <p><strong>レスポンス</strong>：200 OK（リスト）</p>
   */
  @GET
  public Response list(@QueryParam("userID") String userID, @QueryParam("userId") String userIdAlias, @QueryParam("userName") String userName) {
    String uid = (userID != null && !userID.isBlank()) ? userID : ((userIdAlias != null && !userIdAlias.isBlank()) ? userIdAlias : null);

    List<UserAccount> users;
    if (uid != null && userName != null && !userName.isBlank()) {
      users = UserAccount.find("userId = ?1 and userName = ?2", uid, userName).list();
    } else if (uid != null) {
        users = UserAccount.find("userId = ?1", uid).list();
    } else if (userName != null && !userName.isBlank()) {
        users = UserAccount.find("userName = ?1", userName).list();
    } else {
        users = UserAccount.listAll();
    }

    List<UserViewDTO> body = users.stream().map(UserMapper::toView).toList();
    return Response.ok(body).build();
  }

  /**
   * 業務ID（userId）で単一ユーザを取得します。
   * 
   * @param userId userId 業務ID
   * @return 該当ユーザのビューDTO
   * @throws NotFoundException 見つからない場合
   */
  @GET
  @Path("/by-userid/{userId}")
  public UserViewDTO getByUserId(@PathParam("userId") String userId) {
    UserAccount userAccount = UserAccount.findByUserId(userId).orElseThrow(NotFoundException::new);
      return UserMapper.toView(userAccount);
  }

  /**
   * ユーザを作成します。
   * 
   * <p><strong>リクエスト</strong>：{@link UserDataDTO}（バリデーションあり）</p>
   * <p><strong>レスポンス</strong>：201 Created（{@link UserViewDTO}）</p>
   * 
   * @param userDataDTO 送信されたユーザデータ（必須）
   * @return 作成結果のレスポンス（Location ヘッダ付与）
   * @throws ClientErrorException 409：{@code userID} の重複時
   */
  @POST
  @Transactional
  public Response create(@Valid UserDataDTO userDataDTO) {
    if (UserAccount.findByUserId(userDataDTO.getUserID()).isPresent()) {
      throw new ClientErrorException("userID already exists", 409);
    }
    UserAccount userAccount = UserMapper.toEntity(userDataDTO);
    userAccount.persist();
    return Response.created(URI.create("/users/" + userAccount.id))
      .entity(UserMapper.toView(userAccount))
      .build();
  }

  /**
   * 指定IDのユーザを更新します（部分更新）。
   * 
   * <p><strong>ルール</strong></p>
   * <ul>
   *  <li>存在しないID → 404</li>
   *  <li>{@code userID} を変更する場合は重複チェックを実施し、重複時は409</li>
   * </ul>
   * 
   * @param id エンティティID
   * @param userDataDTO 更新値DTO（{@code null} のフィールドは未更新）
   * @return 更新後のビューDTO
   * @throws NotFoundException 見つからない場合
   * @throws ClientErrorException 409：{@code userID} 重複時
   */
  @PUT
  @Path("/{id}")
  @Transactional
  public UserViewDTO update(@PathParam("id") Long id, UserDataDTO userDataDTO) {
    UserAccount userAccount = UserAccount.findById(id);
    if (userAccount == null) {
      throw new NotFoundException();
    }

    if (userDataDTO.getUserID() != null && !userDataDTO.getUserID().equals(userAccount.userId)) {
      if (UserAccount.findByUserId(userDataDTO.getUserID()).isPresent()) {
        throw new ClientErrorException("userID already exists", 409);
      }
        userAccount.userId = userDataDTO.getUserID();
      }
      UserMapper.applyUpdate(userAccount, userDataDTO);
      return UserMapper.toView(userAccount);
  }

  /**
   * 指定IDのユーザを削除します。
   * 
   * @param id エンティティID
   * @throws NotFoundException 見つからない場合
   */
  @DELETE
  @Path("/{id}")
  @Transactional
  public void delete(@PathParam("id") Long id) {
    if (!UserAccount.deleteById(id)) {
      throw new NotFoundException();
    }
  }
}

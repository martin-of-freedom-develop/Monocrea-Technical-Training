package jp.co.monocrea.mapper;

import java.time.ZoneId;

import jp.co.monocrea.dto.UserDataDTO;
import jp.co.monocrea.dto.UserViewDTO;
import jp.co.monocrea.entity.UserAccount;

public final class UserMapper {
    private UserMapper() {

    }

    public static UserAccount toEntity(UserDataDTO dto) {
        UserAccount e = new UserAccount();
        e.userName = dto.getUserName();
        e.userId   = dto.getUserID();
        e.password = dto.getUserPW();

        if (dto.getAccountCreate() != null) {
            e.accountCreate = dto.getAccountCreate()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        }
        return e;
    }

    public static UserViewDTO toView(UserAccount e) {
        return new UserViewDTO(e.userName, e.userId, e.accountCreate);
    }

    public static void applyUpdate(UserAccount e, UserDataDTO dto) {
        if (dto.getUserName() != null) {
            e.userName = dto.getUserName();
        }

        if (dto.getUserPW() != null) {
            e.password = dto.getUserPW();
        }

        if (dto.getUserID() != null && !dto.getUserID().equals(e.userId)) {
            e.userId = dto.getUserID();
        }
    }
}

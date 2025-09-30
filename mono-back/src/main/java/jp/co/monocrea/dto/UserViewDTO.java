package jp.co.monocrea.dto;

import java.time.LocalDate;

public class UserViewDTO {
    public String userName;

    public String userID;

    public LocalDate accountCreate;

    public UserViewDTO() {

    }

    public UserViewDTO(String userName, String userID, LocalDate accountCreate) {
        this.userName = userName;
        this.userID = userID;
        this.accountCreate = accountCreate;
    }
}

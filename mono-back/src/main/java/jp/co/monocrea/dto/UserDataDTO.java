package jp.co.monocrea.dto;

import java.util.Date;

public class UserDataDTO {

    private String userName;

    private String userID;

    private String userPW;

    private Date accountCreate;

    public String getUserName() {
        return userName;
    }

    public String getUserID() {
        return userID;
    }

    public String getUserPW() {
        return userPW;
    }

    public Date getAccountCreate() {
        return accountCreate;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public void setUserPW(String userPW) {
        this.userPW = userPW;
    }

    public void setAccountCreate(Date accountCreate) {
        this.accountCreate = accountCreate;
    }
}

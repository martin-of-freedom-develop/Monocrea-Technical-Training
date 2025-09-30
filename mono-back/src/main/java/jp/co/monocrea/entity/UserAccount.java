package jp.co.monocrea.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Optional;

@Entity
@Table(name = "usermanagement")
public class UserAccount extends PanacheEntity {
    @Column(name = "username", nullable = false)
    public String userName;

    @Column(name = "userid", nullable = false, unique = true, length = 64)
    public String userId;

    @Column(name = "userpw", nullable = false, length = 64)
    public String password;

    @Column(name = "accountcreate", nullable = false)
    public LocalDate accountCreate;

    @PrePersist
    void onCreate() {
        if (accountCreate == null) {
            accountCreate = LocalDate.now();
        }
    }

    public static Optional<UserAccount> findByUserId(String userId) {
        return find("userId", userId).firstResultOptional();
    }
}

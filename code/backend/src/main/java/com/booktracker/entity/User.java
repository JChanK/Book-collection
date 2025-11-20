// User.java
package com.booktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @Getter
    @Setter
    @NotBlank
    @Size(max = 50)
    @Column(unique = true, name = "username")
    private String username;

    @Column(name = "register_date")
    private LocalDateTime registerDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CollectionEntry> collectionEntries = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews = new HashSet<>();

    @Getter
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @PrePersist
    protected void onCreate() {
        registerDate = LocalDateTime.now();
        if (this.avatarUrl == null) {
            this.avatarUrl = String.format("https://ui-avatars.com/api/?name=%s&background=random&color=fff&size=256",
                    this.username.replace(" ", "+"));
        }
    }

}
package com.booktracker.repository;

import com.booktracker.entity.UserList;
import com.booktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UserListRepository extends JpaRepository<UserList, Long>, JpaSpecificationExecutor<UserList> {
    List<UserList> findByUser(User user);
    Optional<UserList> findByIdAndUser(Long id, User user);
    boolean existsByUserAndName(User user, String name);
}
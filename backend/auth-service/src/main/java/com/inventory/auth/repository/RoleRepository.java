package com.inventory.auth.repository;

import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
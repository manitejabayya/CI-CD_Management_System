package com.maniteja.cicdplatform.repository;

import com.maniteja.cicdplatform.entity.RepositoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepositoryEntityRepository
        extends JpaRepository<RepositoryEntity, Long> {

    List<RepositoryEntity> findByUserId(Long userId);
}
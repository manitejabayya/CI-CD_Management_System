package com.maniteja.cicdplatform.service;

import com.maniteja.cicdplatform.dto.RepositoryRequest;
import com.maniteja.cicdplatform.entity.RepositoryEntity;
import com.maniteja.cicdplatform.entity.User;
import com.maniteja.cicdplatform.repository.RepositoryEntityRepository;
import com.maniteja.cicdplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RepositoryService {

    private final RepositoryEntityRepository repository;
    private final UserRepository userRepository;

    public RepositoryEntity addRepository(
            RepositoryRequest request
    ) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        RepositoryEntity repo = RepositoryEntity.builder()
                .repoName(request.getRepoName())
                .githubUrl(request.getGithubUrl())
                .branchName(request.getBranchName())
                .user(user)
                .build();

        return repository.save(repo);
    }

    public List<RepositoryEntity> getRepositories() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return repository.findByUserId(user.getId());
    }

    public String deleteRepository(Long id) {

        repository.deleteById(id);

        return "Repository Deleted Successfully";
    }
}
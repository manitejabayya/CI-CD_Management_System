package com.maniteja.cicdplatform.controller;

import com.maniteja.cicdplatform.dto.RepositoryRequest;
import com.maniteja.cicdplatform.entity.RepositoryEntity;
import com.maniteja.cicdplatform.service.RepositoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepositoryController {

    private final RepositoryService repositoryService;

    @PostMapping
    public RepositoryEntity addRepository(
            @RequestBody RepositoryRequest request
    ) {
        return repositoryService.addRepository(request);
    }

    @GetMapping
    public List<RepositoryEntity> getRepositories() {
        return repositoryService.getRepositories();
    }

    @DeleteMapping("/{id}")
    public String deleteRepository(
            @PathVariable Long id
    ) {
        return repositoryService.deleteRepository(id);
    }
}
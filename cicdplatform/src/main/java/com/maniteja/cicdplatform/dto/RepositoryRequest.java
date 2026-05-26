package com.maniteja.cicdplatform.dto;

import lombok.Data;

@Data
public class RepositoryRequest {

    private String repoName;

    private String githubUrl;

    private String branchName;
}
package com.maniteja.cicdplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "repositories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String repoName;

    private String githubUrl;

    private String branchName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
package com.maniteja.cicdplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuildResponse {

    private Integer buildNumber;

    private String status;

    private String url;
}
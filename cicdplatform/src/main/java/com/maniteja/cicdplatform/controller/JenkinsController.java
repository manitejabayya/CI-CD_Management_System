package com.maniteja.cicdplatform.controller;

import com.maniteja.cicdplatform.service.JenkinsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.maniteja.cicdplatform.dto.BuildResponse;

@RestController
@RequestMapping("/api/jenkins")
@RequiredArgsConstructor
public class JenkinsController {

    private final JenkinsService jenkinsService;

    @PostMapping("/trigger/{jobName}")
    public String triggerBuild(
            @PathVariable String jobName
    ) {

        return jenkinsService.triggerBuild(jobName);
    }
    @GetMapping("/status/{jobName}")
public BuildResponse getBuildStatus(
        @PathVariable String jobName
) {

    return jenkinsService.getBuildStatus(jobName);
}
@GetMapping("/logs/{jobName}")
public String getBuildLogs(
        @PathVariable String jobName
) {

    return jenkinsService.getBuildLogs(jobName);
}

}
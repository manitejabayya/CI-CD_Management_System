package com.maniteja.cicdplatform.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.maniteja.cicdplatform.dto.BuildResponse;
import org.json.JSONObject;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class JenkinsService {

    private final RestTemplate restTemplate;

    @Value("${jenkins.url}")
    private String jenkinsUrl;

    @Value("${jenkins.username}")
    private String username;

    @Value("${jenkins.token}")
    private String token;

    public String triggerBuild(String jobName) {

        String url =
                jenkinsUrl + "/job/" + jobName + "/build";

        HttpHeaders headers = new HttpHeaders();

        String auth = username + ":" + token;

        String encodedAuth = Base64.getEncoder()
                .encodeToString(auth.getBytes());

        headers.set("Authorization", "Basic " + encodedAuth);

        HttpEntity<String> entity =
                new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class
                );

        if (response.getStatusCode().is2xxSuccessful()) {
            return "Build Triggered Successfully";
        }

        return "Failed To Trigger Build";
    }
    public BuildResponse getBuildStatus(String jobName) {

    String url =
            jenkinsUrl +
            "/job/" +
            jobName +
            "/lastBuild/api/json";

    HttpHeaders headers = new HttpHeaders();

    String auth = username + ":" + token;

    String encodedAuth = Base64.getEncoder()
            .encodeToString(auth.getBytes());

    headers.set("Authorization", "Basic " + encodedAuth);

    HttpEntity<String> entity =
            new HttpEntity<>(headers);

    ResponseEntity<String> response =
            restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

    JSONObject json =
            new JSONObject(response.getBody());

    return BuildResponse.builder()
            .buildNumber(json.getInt("number"))
            .status(json.getString("result"))
            .url(json.getString("url"))
            .build();
}
public String getBuildLogs(String jobName) {

    String url =
            jenkinsUrl +
            "/job/" +
            jobName +
            "/lastBuild/consoleText";

    HttpHeaders headers = new HttpHeaders();

    String auth = username + ":" + token;

    String encodedAuth = Base64.getEncoder()
            .encodeToString(auth.getBytes());

    headers.set("Authorization", "Basic " + encodedAuth);

    HttpEntity<String> entity =
            new HttpEntity<>(headers);

    ResponseEntity<String> response =
            restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

    return response.getBody();
}
}
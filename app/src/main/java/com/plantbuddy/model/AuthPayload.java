package com.plantbuddy.model;
public class AuthPayload{
    private String accessToken;
    private User user;

    public String getAccessToken(){
        return accessToken;
    }
    public User getUser(){
        return user;
    }
}
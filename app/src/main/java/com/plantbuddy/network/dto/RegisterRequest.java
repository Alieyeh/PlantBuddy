package com.plantbuddy.network.dto;

public class RegisterRequest{
    private final String username;
    private final String email;
    private final String password;
    private final String displayName;
    public RegisterRequest(String username,String email,String password,String displayName){
        this.username=username;
        this.email=email;
        this.password=password;
        this.displayName=displayName;
    }
}
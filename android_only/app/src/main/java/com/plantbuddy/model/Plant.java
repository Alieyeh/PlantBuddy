package com.plantbuddy.model;
public class Plant{
    private long id;
    private long ownerId;
    private Long sitterId;
    private String name;
    private String species;
    private String profileImageUrl;
    private String room;
    private String careNotes;
    private String lightRequirement;
    private Integer wateringFrequencyDays;
    private Integer wateringVolumeMl;
    private Integer preferredTemperatureC;
    private Integer heightCm;
    private Integer widthCm;
    private Integer weightG;
    private String quirk;
    private String createdAt;
    private String updatedAt;

    public long getId() {
        return id;
    }

    public long getOwnerId() {
        return ownerId;
    }

    public Long getSitterId() {
        return sitterId;
    }

    public String getName() {
        return name;
    }

    public String getSpecies() {
        return species;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getRoom() {
        return room;
    }

    public String getCareNotes() {
        return careNotes;
    }

    public String getLightRequirement() {
        return lightRequirement;
    }

    public Integer getWateringFrequencyDays() {
        return wateringFrequencyDays;
    }

    public Integer getWateringVolumeMl() {
        return wateringVolumeMl;
    }

    public Integer getPreferredTemperatureC() {
        return preferredTemperatureC;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public Integer getWidthCm() {
        return widthCm;
    }

    public Integer getWeightG() {
        return weightG;
    }

    public String getQuirk() {
        return quirk;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setOwnerId(long ownerId) {
        this.ownerId = ownerId;
    }

    public void setSitterId(Long sitterId) {
        this.sitterId = sitterId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public void setCareNotes(String careNotes) {
        this.careNotes = careNotes;
    }

    public void setLightRequirement(String lightRequirement) {
        this.lightRequirement = lightRequirement;
    }

    public void setWateringFrequencyDays(Integer wateringFrequencyDays) {
        this.wateringFrequencyDays = wateringFrequencyDays;
    }

    public void setWateringVolumeMl(Integer wateringVolumeMl) {
        this.wateringVolumeMl = wateringVolumeMl;
    }

    public void setPreferredTemperatureC(Integer preferredTemperatureC) {
        this.preferredTemperatureC = preferredTemperatureC;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }

    public void setWidthCm(Integer widthCm) {
        this.widthCm = widthCm;
    }

    public void setWeightG(Integer weightG) {
        this.weightG = weightG;
    }

    public void setQuirk(String quirk) {
        this.quirk = quirk;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
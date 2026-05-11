package com.plantbuddy.network.dto;
public class PlantRequest{
    private final String name;
    private final String species;
    private final String profileImageUrl;
    private final String room;
    private final String careNotes;
    private final String lightRequirement;
    private final Integer wateringFrequencyDays;
    private final Integer wateringVolumeMl;
    private final Integer preferredTemperatureC;
    private final Integer heightCm;
    private final Integer widthCm;
    private final Integer weightG;
    private final String quirk;
    public PlantRequest(String name,String species,String profileImageUrl,
                        String room,String careNotes,String lightRequirement,
                        Integer wateringFrequencyDays,Integer wateringVolumeMl,
                        Integer preferredTemperatureC,Integer heightCm,Integer widthCm,
                        Integer weightG,String quirk){
        this.name=name;
        this.species=species;
        this.profileImageUrl=profileImageUrl;
        this.room=room;
        this.careNotes=careNotes;
        this.lightRequirement=lightRequirement;
        this.wateringFrequencyDays=wateringFrequencyDays;
        this.wateringVolumeMl=wateringVolumeMl;
        this.preferredTemperatureC=preferredTemperatureC;
        this.heightCm=heightCm;
        this.widthCm=widthCm;
        this.weightG=weightG;
        this.quirk=quirk;}
}
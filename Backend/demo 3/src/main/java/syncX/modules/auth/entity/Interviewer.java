package syncX.modules.auth.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "interviewers")
public class Interviewer {

    // Primary key is user_id (matches the DB: interviewers_pkey PRIMARY KEY (user_id)).
    // NOTE: previously @Id was on interviewer_id, which made JPA treat two
    // interviewers sharing an emp ID as the SAME row — turning a new INSERT into
    // an UPDATE of the existing row (the source of the FK error + orphaned user).
    @Id
    @Column(name = "user_id")
    private UUID userId;

    // Employee ID — unique PER COMPANY (composite unique on company_id + interviewer_id),
    // NOT globally. No longer the entity identity.
    @Column(name = "interviewer_id", nullable = false)
    private String interviewerId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "interviewer_role")
    private String interviewerRole;

    @Column(name = "branch")
    private String branch;

    @Column(name = "address")
    private String address;

    @Column(name = "about")
    private String about;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "email")
    private String email;
}
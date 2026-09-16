CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    erp_capacity INTEGER NOT NULL CHECK (erp_capacity > 0)
);



CREATE TABLE associations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);


CREATE TABLE activities (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    base_price NUMERIC(10,2) NOT NULL
        CHECK (base_price >= 0),

    max_capacity INTEGER NOT NULL
        CHECK (max_capacity > 0),

    age_category VARCHAR(50) NOT NULL,

    association_id INTEGER NOT NULL,

    facility_id INTEGER NOT NULL,

    weekday INTEGER NOT NULL
        CHECK (weekday BETWEEN 1 AND 7),

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    subzone VARCHAR(100),

    CONSTRAINT fk_activity_association
        FOREIGN KEY (association_id)
        REFERENCES associations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_facility
        FOREIGN KEY (facility_id)
        REFERENCES facilities(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_activity_time
        CHECK (end_time > start_time)
);

CREATE TABLE families (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL
);


CREATE TABLE members (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    birth_date DATE NOT NULL,

    resident BOOLEAN NOT NULL DEFAULT FALSE,

    qf NUMERIC(10,2) NOT NULL
        CHECK (qf >= 0),

    medical_certificate_date DATE,

    family_id INTEGER,

    CONSTRAINT fk_member_family
        FOREIGN KEY (family_id)
        REFERENCES families(id)
        ON DELETE SET NULL
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,

    member_id INTEGER NOT NULL,

    activity_id INTEGER NOT NULL,

    final_price NUMERIC(10,2) NOT NULL
        CHECK (final_price >= 15),

    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registration_member
        FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_registration_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT check_registration_status
        CHECK (
            status IN (
                'confirmed',
                'cancelled'
            )
        ),

    CONSTRAINT unique_member_activity
        UNIQUE (member_id, activity_id)
);


CREATE TABLE waiting_list (
    id SERIAL PRIMARY KEY,

    member_id INTEGER NOT NULL,

    activity_id INTEGER NOT NULL,

    priority_score INTEGER NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'waiting',

    deadline_confirmation TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_waiting_member
        FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_waiting_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT check_waiting_status
        CHECK (
            status IN (
                'waiting',
                'promoted_pending',
                'expired',
                'cancelled'
            )
        ),

    CONSTRAINT unique_waiting_member_activity
        UNIQUE (member_id, activity_id)
);





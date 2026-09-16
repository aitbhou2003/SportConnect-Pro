INSERT INTO facilities (name, erp_capacity)
VALUES
    ('Complexe Sportif Al Amal', 500),
    ('Piscine Municipale', 200),
    ('Dojo Municipal', 100);

INSERT INTO associations (name)
VALUES
    ('Club de Football Rehamna'),
    ('Club de Natation Rehamna'),
    ('Club de Judo Rehamna');

INSERT INTO families (name)
VALUES
    ('Famille A'),
    ('Famille B');

INSERT INTO members (
    name,
    birth_date,
    resident,
    qf,
    medical_certificate_date,
    family_id
)
VALUES
    (
        'Ahmed',
        '2011-05-10',
        TRUE,
        500,
        '2026-01-10',
        1
    ),
    (
        'Yassine',
        '2008-03-20',
        TRUE,
        700,
        '2026-02-15',
        1
    ),
    (
        'Omar',
        '1995-08-12',
        FALSE,
        1200,
        '2026-03-01',
        2
    );

INSERT INTO activities (
    name,
    base_price,
    max_capacity,
    age_category,
    association_id,
    facility_id,
    weekday,
    start_time,
    end_time,
    subzone
)
VALUES
    (
        'Football U15',
        200,
        20,
        'Cadet U15',
        1,
        1,
        2,
        '17:00',
        '18:30',
        'Terrain A'
    ),
    (
        'Natation Senior',
        300,
        15,
        'Senior',
        2,
        2,
        3,
        '18:00',
        '19:30',
        NULL
    ),
    (
        'Judo U18',
        250,
        12,
        'Junior U18',
        3,
        3,
        4,
        '17:30',
        '19:00',
        NULL
    );
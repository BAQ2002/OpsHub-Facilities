BEGIN;

UPDATE SERVICE_FIELD_TYPE
SET TYPE = 'MEDIA',
    OPTIONS = '{"multiple": true, "accept": ["image/*", "video/*"]}'::JSONB,
    REQUIRED = TRUE
WHERE (
       NAME ILIKE '%anexo%'
    OR NAME ILIKE '%foto%'
    OR NAME ILIKE '%fotografico%'
    OR NAME ILIKE '%fotográfico%'
)
AND (
       TYPE IS DISTINCT FROM 'MEDIA'
    OR OPTIONS IS DISTINCT FROM '{"multiple": true, "accept": ["image/*", "video/*"]}'::JSONB
    OR REQUIRED IS DISTINCT FROM TRUE
);

COMMIT;

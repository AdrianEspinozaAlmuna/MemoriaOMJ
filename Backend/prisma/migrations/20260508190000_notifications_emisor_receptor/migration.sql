DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS invitacion_grupo CASCADE;
DROP TABLE IF EXISTS invitation_grupo CASCADE;

CREATE TABLE notificaciones (
  id_notificacion SERIAL PRIMARY KEY,
  id_emisor INTEGER NOT NULL,
  id_receptor INTEGER,
  id_actividad INTEGER,
  tipo tipo_notificacion NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notificaciones_id_emisor_fkey
    FOREIGN KEY (id_emisor)
    REFERENCES usuario(id_usuario)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT notificaciones_id_receptor_fkey
    FOREIGN KEY (id_receptor)
    REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT notificaciones_id_actividad_fkey
    FOREIGN KEY (id_actividad)
    REFERENCES actividad(id_actividad)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
);

CREATE INDEX idx_notificaciones_emisor ON notificaciones(id_emisor);
CREATE INDEX idx_notificaciones_receptor ON notificaciones(id_receptor);
CREATE INDEX idx_notificaciones_receptor_leida_fecha ON notificaciones(id_receptor, leida, fecha_envio);
CREATE INDEX idx_notificaciones_actividad ON notificaciones(id_actividad);

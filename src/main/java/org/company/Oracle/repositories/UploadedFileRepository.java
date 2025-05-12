package org.company.Oracle.repositories;

import org.company.Oracle.models.UploadedFiles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UploadedFileRepository extends JpaRepository<UploadedFiles, Long> {

    Optional<UploadedFiles> findByName(String filename);
}

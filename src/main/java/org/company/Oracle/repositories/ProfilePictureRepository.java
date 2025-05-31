package org.company.Oracle.repositories;

import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, Integer> {
    Optional<ProfilePicture> findById(Long id);
    ProfilePicture findByUser(User user);
}

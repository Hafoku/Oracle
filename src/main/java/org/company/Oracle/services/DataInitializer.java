package org.company.Oracle.services;

import org.company.Oracle.models.Role;
import org.company.Oracle.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.saveAll(Arrays.asList(
                    new Role(null, "USER"),
                    new Role(null, "MODERATOR"),
                    new Role(null, "ADMIN")
            ));
        }
    }
}

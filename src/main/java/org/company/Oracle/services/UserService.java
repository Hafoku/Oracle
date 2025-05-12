package org.company.Oracle.services;

import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.Role;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.repositories.RoleRepository;
import org.company.Oracle.models.User;
import org.company.Oracle.dto.UserDTO;
import org.company.Oracle.exceptions.UserAlreadyExistException;
import org.company.Oracle.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService implements IUserService {

    public static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    public Optional<User> findUserById(Long id){
        return userRepository.findById(id);
    }

    private Role getRolesFromName(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow( () -> new RuntimeException("Роль не найдена"));
    }

    @Override
    public User registerNewUserAccount(UserDTO userDto) throws UserAlreadyExistException {
        if (emailExists(userDto.getEmail())) {
            throw new UserAlreadyExistException("There is an account with that email address: "
                    + userDto.getEmail());
        }

        User user = new User();
        user.setName(userDto.getName());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setEmail(userDto.getEmail());
        user.setRole(getRolesFromName("USER"));
        logger.info("Пользователь {} успешно зарегистрировался c ролью {}", user.getName(), user.getRole());

        return userRepository.save(user);
    }

    private boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public User findAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        if (user == null){
            throw new RuntimeException("Пользователь не найден. Почта: " + email);
        }
        logger.info("Найден пользователь {} с почтой {}", user.getName(), user.getEmail());
        return user;
    }

    public void updatePassword (User user, String password){
        user.setPassword(passwordEncoder.encode(password));
    }

    public boolean checkIfValidOldPassword(User user, String oldpassword) {
        return BCrypt.checkpw(oldpassword, user.getPassword());
    }

    public String verify(User user) {
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

        if (authentication.isAuthenticated()){
            return jwtService.generateToken(user.getEmail());
        }

        return "fail";
    }
}

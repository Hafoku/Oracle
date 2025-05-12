package org.company.Oracle.services;

import org.company.Oracle.dto.UserDTO;
import org.company.Oracle.exceptions.UserAlreadyExistException;
import org.company.Oracle.models.User;

public interface IUserService {
    User registerNewUserAccount(UserDTO userDto) throws UserAlreadyExistException;
}


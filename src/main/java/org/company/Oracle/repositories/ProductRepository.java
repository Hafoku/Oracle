package org.company.Oracle.repositories;

import org.company.Oracle.models.Product;
import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends CrudRepository<Product, Long> {

}

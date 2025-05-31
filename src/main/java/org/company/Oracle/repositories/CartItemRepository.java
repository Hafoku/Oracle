package org.company.Oracle.repositories;

import org.company.Oracle.models.CartItem;
import org.company.Oracle.models.Product;
import org.springframework.data.repository.CrudRepository;

public interface CartItemRepository extends CrudRepository<CartItem, Long> {
    void deleteByProduct(Product product);
}

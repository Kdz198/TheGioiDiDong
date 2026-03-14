package tgdd.org.productservice.util;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class SpecBuilder<T> {

    private final List<Specification<T>> specs = new ArrayList<>();

    public SpecBuilder<T> withEquals(String key, Object value) {
        if (value != null) {
            specs.add((root, query, cb) -> cb.equal(root.get(key), value));
        }
        return this;
    }

    public SpecBuilder<T> withLike(String key, String value) {
        if (value != null && !value.trim().isEmpty()) {
            specs.add((root, query, cb) -> cb.like(cb.lower(root.get(key)), "%" + value.toLowerCase() + "%"));
        }
        return this;
    }

    public <Y extends Comparable<? super Y>> SpecBuilder<T> withGreaterThanOrEqual(String key, Y value) {
        if (value != null) {
            specs.add((root, query, cb) -> cb.greaterThanOrEqualTo(root.get(key), value));
        }
        return this;
    }


    public <Y extends Comparable<? super Y>> SpecBuilder<T> withLessThanOrEqual(String key, Y value) {
        if (value != null) {
            specs.add((root, query, cb) -> cb.lessThanOrEqualTo(root.get(key), value));
        }
        return this;
    }

    public Specification<T> build() {
        if (specs.isEmpty()) {
            return (root, query, cb) -> cb.conjunction();
        }

        Specification<T> result = specs.get(0);
        for (int i = 1; i < specs.size(); i++) {
            result = Specification.where(result).and(specs.get(i));
        }
        return result;
    }
}
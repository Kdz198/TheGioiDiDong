package tgdd.org.userservice.Model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import tgdd.org.userservice.Enum.Permission;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    private String password;

    private String fullName;

    private boolean isActive = true;

    @CreationTimestamp
    Instant createdAt;

    @UpdateTimestamp
    Instant  updatedAt;

    @ManyToOne
    @JoinColumn
    Role role;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Set<Permission> customPermissions = new HashSet<>();
}

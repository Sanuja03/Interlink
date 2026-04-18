package syncX.modules.SuperAdmin.Admin_settings.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "super_admin_settings")
public class SASettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    @Column(name = "key_name")
    private String keyName;

    private String value;

    // getters
    public Long getId() { return id; }

    public String getCategory() { return category; }

    public String getKeyName() { return keyName; }

    public String getValue() { return value; }

    // setters
    public void setId(Long id) { this.id = id; }

    public void setCategory(String category) { this.category = category; }

    public void setKeyName(String keyName) { this.keyName = keyName; }

    public void setValue(String value) { this.value = value; }
}
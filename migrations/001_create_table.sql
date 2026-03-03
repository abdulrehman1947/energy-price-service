CREATE TABLE IF NOT EXISTS energy_market_prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  energy_type VARCHAR(50) NOT NULL,
  price_date DATE NOT NULL,
  category VARCHAR(150) NOT NULL,
  value DECIMAL(12,4),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_energy_price_unique (energy_type, price_date, category),
  INDEX idx_price_date (price_date),
  INDEX idx_energy_type (energy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

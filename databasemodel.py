# databasemodel.py
from sqlalchemy import Column, Integer, String, Float
from database import Base   

class Products(Base):
    __tablename__ = "Dashboard"

    Id = Column(Integer, primary_key=True, index=True)
    Name = Column(String)
    Email = Column(String)
    Password = Column(String)
    Role = Column(String)
    
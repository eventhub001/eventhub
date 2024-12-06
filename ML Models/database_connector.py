import mariadb
import sys
import mariadb.cursors
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()


class MariaDBConnection:
    def __init__(self, user, password, host, port, database):
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.database = database
        self.conn = None

    def connect(self):
        try:
            self.conn = mariadb.connect(
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port,
                database=self.database
            )
            print("Connected to the database.")
        except mariadb.Error as e:
            print(f"Error connecting to MariaDB Platform: {e}")
            sys.exit(1)

    def fetch_data(self, query):
        if self.conn is None:
            print("Connection is not established.")
            return None

        try:
            cur = self.conn.cursor()
            cur.execute(query)
            return cur.fetchall()
        except mariadb.Error as e:
            print(f"Error fetching data: {e}")
        finally:
            cur.close()

    def close(self):
        if self.conn:
            self.conn.close()
            print("Connection closed.")


# Main function
db = MariaDBConnection(
    user="root",
    password="admin",
    host="localhost",
    port=3306,
    database="proyecto3"
)

print("connecting using password:");
print(os.environ.get("PASSWORD"))

db.connect()
def select_table(table_name: str):
    
    query = f"SELECT * FROM {table_name}"
    column_names = db.fetch_data(f"SHOW COLUMNS FROM {table_name}")
    results = db.fetch_data(query)
    return parse_to_df(results, column_names)


def parse_to_df(results, columns):
    # Extract results and column names
    data = results

    column_names = [column[0] for column in columns]    
    # Create DataFrame with column names
    df = pd.DataFrame(data, columns=column_names)
    return df
# Example usage
if __name__ == "__main__":
    db = MariaDBConnection(
        user="root",
        password="admin",
        host="localhost",
        port=3306,
        database="proyecto3"
    )

    db.connect()
    eventform = select_table("event_form")
        
    result = eventform.groupby('user_id').apply(
        lambda x: ', '.join(f"Pregunta: {row['question']} {row['answer']}..." for _, row in x.iterrows())
    ).reset_index(name='combined')

    print(result)


    db.close()

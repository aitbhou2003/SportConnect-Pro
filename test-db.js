const pool = require("./src/config/database")
// console.log(pool);


async function testDatabse() {
    try {
        const result = await pool.query("SELECT NOW()");
        

        console.log("databse connected");
        console.log(result.rows[0]);
        
        
    } catch (error) {
        console.error("datababse connection failde");
        console.log(error.message);
        
        
    }
    finally{
        await pool.end()
    }
}


testDatabse()
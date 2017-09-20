/*
VIEW:       v_lastest_barangay_info_dates
CODE:

SELECT 		barangay_info.BARANGAY AS BARANGAY,
            max(barangay_info.createdAt) AS createdAt
FROM 		barangay_info
GROUP BY 	barangay_info.BARANGAY
*/


/*
VIEW:       v_latest_barangay_info
CODE:

SELECT      barangay_info.*
FROM        barangay_info JOIN v_lastest_barangay_info_dates
            WHERE barangay_info.createdAt = v_lastest_barangay_info_dates.createdAt
            AND barangay_info.BARANGAY = v_lastest_barangay_info_dates.BARANGAY
*/

/*
 VIEW:       v_place_names
 CODE:

SELECT     city.ID AS CITY_ID,
            district.ID AS DISTRICT_ID,
            barangay.ID AS BARANGAY_ID,
            city.NAME AS CITY_NAME,
            district.NAME AS DISTRICT_NAME,
            barangay.NAME AS BARANGAY_NAME,
            barangay.isCOASTAL AS isCOASTAL
FROM        city join district JOIN barangay
            WHERE district.CITY = city.ID
            AND barangay.DISTRICT = district.ID
 */



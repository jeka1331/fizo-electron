SELECT 
    a.UprazhnenieId AS a_UprazhnenieId,
    a.CategoryId AS a_CategoryId,
    a.peopleId AS a_PeopleId,
    a.date AS a_Date,
    a.podrazdelenieId AS a_PodrazdelenieId,
    b.b_Date,
    b.b_Result
FROM (
    SELECT 
        FU.UprazhnenieId,
        FU.CategoryId,
        P.id AS peopleId,
        FU.date,
        P.podrazdelenieId
    FROM 
        FixedUprs AS FU
    LEFT JOIN 
        People AS P ON FU.CategoryId = P.categoryId
) AS a
LEFT JOIN (
    SELECT 
        PersonId AS b_PersonId,
        MAX(date) AS b_Date,
        result AS b_Result
    FROM 
        UprazhnenieResults
    GROUP BY 
        PersonId
) AS b ON a.peopleId = b.b_PersonId 
AND strftime('%Y-%m', a.date) = strftime('%Y-%m', b.b_Date);

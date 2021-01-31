module.exports = {
  tables: [
    {
      TableName: `pull`,
      KeySchema: [
        { AttributeName: 'url', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'url', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'N' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
    {
      TableName: `issue`,
      KeySchema: [
        { AttributeName: 'url', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'url', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'N' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
  ],

}

import React from 'react';
import { View, FlatList, Image, StyleSheet, Text } from 'react-native';

const PendingRoomCarousel = () => {
  const rooms = [
    { id: '1', image: require('../../assets/DMTRoom2.jpg') },
    { id: '2', image: require('../../assets/DMTRoom.jpg') },
    { id: '3', image: require('../../assets/DMTRoom1.jpg') },
    { id: '4', image: require('../../assets/DMTRoom.jpg') }
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.statusContainer}>
        <View style={[styles.circle, { backgroundColor: '#aaa' }]} />
        <Text style={styles.statusText}>Offline</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.roomText}>Room</Text>
      <View style={styles.container}>
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 25,
  },
  roomText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a0a0a0',
    marginBottom: 10,
    marginLeft: 15,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContainer: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 190,
    borderRadius: 10,
    opacity: 0.5, // dimmed image
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 0,
    paddingHorizontal: 15,
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(200, 200, 200, 0.7)',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#777',
  },
});

export default PendingRoomCarousel;
